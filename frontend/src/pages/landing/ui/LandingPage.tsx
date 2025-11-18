import { Header } from '@/widgets/header'
import { Link } from 'react-router-dom'
import styles from './LandingPage.module.css'

export function LandingPage() {
  return (
    <div className={styles.page}>
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Automated
              <br />
              Productivity
              <br />
              Feedback
            </h1>
            <p className={styles.heroDescription}>
              Get continuous, intelligent feedback on your daily performance and
              scheduling. Optimize your time, boost your productivity, and achieve
              your goals faster.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/login" className={styles.getStartedButton}>
                Get Started Free
              </Link>
              <button className={styles.watchDemoButton}>Watch Demo</button>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.iconContainer}>
              <svg
                className={styles.heroIcon}
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 20L60 80H100L80 160L140 100H100L120 20"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Why MinPass Section */}
      <section className={styles.whySection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why MinPass?</h2>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Calendar Integration</h3>
              <p className={styles.featureDescription}>
                Direct CRUD operations on your Google Calendar with real-time
                synchronization.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Task Management</h3>
              <p className={styles.featureDescription}>
                Seamless integration with Google Tasks for unified productivity
                tracking.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                >
                  <line x1="12" y1="20" x2="12" y2="10" />
                  <line x1="18" y1="20" x2="18" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="16" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Smart Analytics</h3>
              <p className={styles.featureDescription}>
                Advanced insights into your performance patterns and productivity
                trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to transform your productivity?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of professionals optimizing their daily performance.
          </p>
          <Link to="/login" className={styles.ctaButton}>
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>© 2025 MinPass. All rights reserved.</p>
      </footer>
    </div>
  )
}

