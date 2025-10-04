import { Profile } from "passport-github2";

export interface GithubUserProfile extends Profile {
  id: string;
  username: string;
  email: string;
  photos: { value: string }[];
  profileUrl: string;
}
