import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { LoginServicePort } from "@auth/core/ports/in/login-service.port";
import { auth } from "@app/contracts";
import { AuthRepositoryPort } from "@auth/core/ports/out/auth.repository.port";
import { AuthTokenPort } from "@auth/core/ports/out/auth.token.port";
import { UserClientPort } from "@auth/core/ports/out/user-client.port";
import { AuthProvider } from "@auth/core/domain/constants/auth-providers";
import { firstValueFrom } from "rxjs";
import {
  FindAuthClientByClientIdAndProviderIdDomainRequestDto,
  FindProviderByProviderDomainRequestDto,
} from "@auth/core/domain/dtos/auth-query.dto";
import {
  CreateAuthTokenDomainRequestDto,
  UpsertAuthTokensInfoDomainRequestDto,
} from "@auth/core/domain/dtos/auth-command.dtos";

/**
 * LoginService
 *
 * Handles OAuth-based social login flows, user account creation/linking,
 * and JWT token generation.
 */
@Injectable()
export class LoginService implements LoginServicePort {
  constructor(
    @Inject(AuthRepositoryPort)
    private readonly authRepository: AuthRepositoryPort,
    @Inject(AuthTokenPort)
    private readonly authToken: AuthTokenPort,
    @Inject(UserClientPort)
    private readonly userClient: UserClientPort,
  ) {}

  /**
   * Main social login handler
   * Determines if user is new or existing and routes accordingly
   */
  async socialLogin(dto: auth.SocialLoginRequest): Promise<auth.LoginResult> {
    // Validate input
    if (!dto.socialUserProfile) {
      throw new BadRequestException("Social user profile is required");
    }

    // Find OAuth provider configuration
    const provider = await this.validateProvider(dto.provider);

    // Try to find existing auth client
    const existingClient =
      await this.authRepository.findAuthClientByClientIdAndProviderId(
        new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
          provider.id,
          dto.socialUserProfile.clientId,
        ),
      );

    // Route to existing or new user flow
    if (existingClient) {
      return await this.handleExistingUser(existingClient, dto);
    } else {
      return await this.handleNewUser(provider, dto);
    }
  }

  /**
   * Validates that the OAuth provider exists and is configured
   */
  private async validateProvider(providerName: string) {
    const provider = await this.authRepository.findProviderByProvider(
      new FindProviderByProviderDomainRequestDto(providerName as AuthProvider),
    );

    if (!provider) {
      throw new NotFoundException(
        `OAuth provider '${providerName}' not found or not configured`,
      );
    }

    return provider;
  }

  /**
   * Handles login for existing users
   * Updates tokens and returns login result
   */
  private async handleExistingUser(
    authClient: any,
    dto: auth.SocialLoginRequest,
  ): Promise<auth.LoginResult> {
    // Fetch user details
    const user = await firstValueFrom(
      this.userClient.findOneUser({ id: authClient.userId }),
    );

    if (!user) {
      throw new NotFoundException(
        `User with ID '${authClient.userId}' not found`,
      );
    }

    // Generate new JWT tokens
    const tokens = await this.authToken.generateTokens({
      userId: user.id,
      email: user.email,
    });

    // Update provider tokens
    await this.updateProviderTokens(authClient.id, dto, tokens.refreshToken);

    return {
      userId: user.id,
      accessToken: tokens.accessToken,
      isNewUser: false,
    };
  }

  /**
   * Handles login for new users
   * Creates user account, auth client, and tokens
   */
  private async handleNewUser(
    provider: any,
    dto: auth.SocialLoginRequest,
  ): Promise<auth.LoginResult> {
    // Ensure email is not already in use
    await this.validateNewUserEmail(dto.socialUserProfile!.email);

    // Create new user account
    const newUser = await this.createNewUserAccount(dto.socialUserProfile!);

    // Create auth client linking
    const authClient = await this.createAuthClient(
      newUser.id,
      provider.id,
      dto.socialUserProfile!.clientId,
    );

    // Generate and save tokens
    await this.generateAndSaveTokens(
      authClient.id,
      newUser.id,
      newUser.email,
      dto,
    );

    // Generate JWT tokens for response
    const tokens = await this.authToken.generateTokens({
      userId: newUser.id,
      email: newUser.email,
    });

    return {
      userId: newUser.id,
      accessToken: tokens.accessToken,
      isNewUser: true,
    };
  }

  /**
   * Validates that email is not already registered
   */
  private async validateNewUserEmail(email: string): Promise<void> {
    const existingUser = await firstValueFrom(
      this.userClient.findOneUserByEmail({ email }),
    ).catch(() => null);

    if (existingUser) {
      throw new ConflictException(
        `User with email '${email}' already exists. Please link your account instead.`,
      );
    }
  }

  /**
   * Creates new user account via User microservice
   */
  private async createNewUserAccount(
    profile: auth.SocialUserProfile,
  ): Promise<any> {
    const newUser = await firstValueFrom(
      this.userClient.createUser({
        email: profile.email,
        locale: "ko",
        displayName: profile.name,
      }),
    );

    if (!newUser) {
      throw new InternalServerErrorException("Failed to create user account");
    }

    return newUser;
  }

  /**
   * Creates AuthClient record linking user to OAuth provider
   */
  private async createAuthClient(
    userId: string,
    providerId: string,
    clientId: string,
  ): Promise<any> {
    const authClient = await this.authRepository.createAuthClient({
      userId,
      providerId,
      clientId,
      salt: null,
    });

    if (!authClient) {
      throw new InternalServerErrorException("Failed to create auth client");
    }

    // Need to fetch the created client to get its ID
    const createdClient =
      await this.authRepository.findAuthClientByClientIdAndProviderId(
        new FindAuthClientByClientIdAndProviderIdDomainRequestDto(
          providerId,
          clientId,
        ),
      );

    if (!createdClient) {
      throw new InternalServerErrorException(
        "Failed to retrieve created auth client",
      );
    }

    return createdClient;
  }

  /**
   * Generates JWT tokens and saves provider tokens
   */
  private async generateAndSaveTokens(
    authClientId: string,
    userId: string,
    userEmail: string,
    dto: auth.SocialLoginRequest,
  ): Promise<void> {
    const tokens = await this.authToken.generateTokens({
      userId,
      email: userEmail,
    });

    const tokenInfo = await this.authRepository.createAuthToken({
      authClientId,
      providerAccessToken: dto.socialUserProfile!.providerAccessToken,
      providerRefreshToken: dto.socialUserProfile!.providerRefreshToken,
      refreshToken: tokens.refreshToken,
      revoked: false,
    } as CreateAuthTokenDomainRequestDto);

    if (!tokenInfo) {
      throw new InternalServerErrorException("Failed to save auth tokens");
    }
  }

  /**
   * Updates OAuth provider tokens for existing users
   */
  private async updateProviderTokens(
    authClientId: string,
    dto: auth.SocialLoginRequest,
    refreshToken: string,
  ): Promise<void> {
    const upsertedTokenInfo = await this.authRepository.upsertAuthTokens({
      authClientId,
      providerAccessToken: dto.socialUserProfile!.providerAccessToken,
      providerRefreshToken: dto.socialUserProfile!.providerRefreshToken,
      refreshToken,
      revoked: false,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      updatedAt: new Date(Date.now()),
    } as UpsertAuthTokensInfoDomainRequestDto);

    if (!upsertedTokenInfo) {
      throw new InternalServerErrorException("Failed to update auth tokens");
    }
  }
}
