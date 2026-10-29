import { Link } from 'react-router-dom';
import LegalLayout from '../components/LandingPage/LegalLayout';
import LegalSection from '../components/LandingPage/LegalSection';

const Privacy = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="September 2026">
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        This Privacy Policy explains what information EduBeacon ("we", "us") collects when you
        use EduBeacon (the "Service"), why we collect it, and who else sees it. It applies to
        students, teachers, and administrators.
      </p>

      <LegalSection heading="1. Information we collect">
        <p>
          <strong>Account information:</strong> your name, email address, an optional username,
          and a password. We never store your password itself — only a one-way cryptographic hash
          of it.
        </p>
        <p>
          <strong>Course and access records:</strong> which courses and lectures you have been
          granted access to, when that access expires, and (for teachers) the courses and
          lectures you create.
        </p>
        <p>
          <strong>Uploaded content:</strong> if you are a teacher, the video files, thumbnail
          images, and course/lecture descriptions you upload.
        </p>
        <p>
          <strong>Login security data:</strong> failed sign-in attempts and temporary lockout
          status, used only to protect your account from unauthorized access attempts.
        </p>
        <p>
          We do not use advertising cookies, and we do not use third-party analytics or tracking
          scripts. The Service keeps you signed in using your browser's local storage, not
          tracking cookies.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <ul className="list-disc pl-6 space-y-1">
          <li>To create and maintain your account, and to authenticate you when you sign in;</li>
          <li>To enforce course and lecture access grants and their expiry dates;</li>
          <li>To send account-related emails: email verification, one-time sign-in codes, password reset links, and notifications about upcoming or expired access;</li>
          <li>To protect the Service and its users against abuse, such as repeated failed sign-in attempts.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Who else processes your data">
        <p>
          We use the following service providers to run EduBeacon. Each only receives the data it
          needs to perform its function, and none of them are permitted to use your data for their
          own purposes.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>MongoDB Atlas</strong> — hosts our database (account records, course/lecture metadata, access grants).</li>
          <li><strong>Amazon Web Services (S3 and CloudFront)</strong> — stores uploaded videos and thumbnail images, and delivers them to you via time-limited, signed links.</li>
          <li><strong>Resend</strong> — delivers the transactional emails described above (verification, sign-in codes, password resets, access notifications).</li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. How long we keep your data">
        <p>
          We keep your account information for as long as your account is active. Expired course
          or lecture access grants are kept on your account as a record of past access, rather
          than deleted. If you would like your account and associated data deleted, contact us
          using the details below — this is currently handled manually on request, as the Service
          does not yet have a self-service deletion option.
        </p>
      </LegalSection>

      <LegalSection heading="5. Security">
        <p>
          Passwords are stored as one-way hashes, never in plain text. Sign-in is protected by
          rate limiting and a temporary lockout after repeated failed attempts. Video and
          thumbnail content is served through time-limited, signed links rather than public URLs.
          No method of storage or transmission is 100% secure, but we take reasonable steps to
          protect your information.
        </p>
      </LegalSection>

      <LegalSection heading="6. Children's privacy">
        <p>
          If you are under the age of 18, you should only use the Service with the involvement and
          consent of a parent or legal guardian.
        </p>
      </LegalSection>

      <LegalSection heading="7. Your rights">
        <p>
          You can review and update your name from your account settings at any time. For any
          other request — correcting inaccurate information, obtaining a copy of your data, or
          deleting your account — contact us at the email below and we will respond as soon as we
          reasonably can.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. If we make a material change, we
          will update the "Last updated" date above.
        </p>
      </LegalSection>

      <LegalSection heading="9. Contact">
        <p>
          Questions about this Privacy Policy, or requests about your data, can be sent to{' '}
          <a href="mailto:legal@edubeacon.com" className="text-purple-600 dark:text-purple-400 hover:underline">
            legal@edubeacon.com
          </a>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        See also our{' '}
        <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </LegalLayout>
  );
};

export default Privacy;
