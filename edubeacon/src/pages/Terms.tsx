import { Link } from 'react-router-dom';
import LegalLayout from '../components/LandingPage/LegalLayout';
import LegalSection from '../components/LandingPage/LegalSection';

const Terms = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="September 2026">
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        These Terms of Service ("Terms") govern your access to and use of EduBeacon (the
        "Service"), which is owned and operated by Gilani School System ("we", "us"). By creating
        an account or otherwise using the Service, you agree to these Terms. If you do not agree,
        please do not use the Service.
      </p>

      <LegalSection heading="1. Who can use EduBeacon">
        <p>
          You must be able to form a legally binding agreement to use the Service. If you are
          under the age of 18, you may only use the Service with the involvement and consent of a
          parent or legal guardian, who is responsible for your use of the account.
        </p>
        <p>
          You are responsible for keeping your account credentials confidential and for all
          activity that happens under your account. Let us know right away if you suspect
          unauthorized access to your account.
        </p>
      </LegalSection>

      <LegalSection heading="2. What EduBeacon is">
        <p>
          EduBeacon is a platform where teachers publish courses and lectures, and students are
          given access to that content. There are three kinds of accounts: students, who view
          course and lecture content; teachers, who create courses and lectures and manage which
          students have access to them; and administrators, who manage teacher accounts.
        </p>
        <p>
          <strong>Course and lecture access is currently granted directly by teachers or
          administrators</strong>, not purchased automatically through the Service. Prices shown
          on a course or lecture are informational; any payment arrangement happens outside the
          Service, and access is switched on by a teacher once that arrangement is settled. We may
          introduce in-Service payments in the future, in which case these Terms will be updated
          accordingly before that happens.
        </p>
      </LegalSection>

      <LegalSection heading="3. Content on the Service">
        <p>
          Teachers retain ownership of the courses, lectures, videos, and other material they
          upload ("Teacher Content"). By uploading Teacher Content, a teacher grants us a
          license to host, store, and stream that content to students who have been granted
          access, solely for the purpose of operating the Service.
        </p>
        <p>
          When a student is granted access to a course or lecture, that access is personal to
          their account and generally time-limited (each grant has an expiry date set by the
          teacher or administrator who issued it). Access does not transfer a copy of the content
          to the student — it permits streaming playback through the Service only, for as long as
          the grant is active.
        </p>
        <p>
          You agree not to download, record, redistribute, resell, or share your account or any
          content you can access through it with anyone else.
        </p>
      </LegalSection>

      <LegalSection heading="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Share your account credentials or let anyone else use your account;</li>
          <li>Attempt to download, scrape, or circumvent access controls on course or lecture content;</li>
          <li>Upload content you do not have the right to share, or that is unlawful, harmful, or infringing;</li>
          <li>Interfere with or disrupt the Service, including attempting to bypass rate limits or security controls;</li>
          <li>Use the Service for any purpose other than teaching or learning on the platform.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="5. Access, suspension, and termination">
        <p>
          A course or lecture grant expires on the date set when it was issued. We do not
          guarantee that an expired grant will be renewed. A teacher or administrator may revoke
          access before its expiry date at their discretion — for example, if there is a dispute
          over an off-platform payment arrangement.
        </p>
        <p>
          We may suspend or terminate an account that violates these Terms, or that we reasonably
          believe poses a risk to the Service or to other users. If you would like your account
          removed, contact us using the details below — account deletion is currently handled
          manually on request rather than through a self-service option.
        </p>
      </LegalSection>

      <LegalSection heading="6. Disclaimers">
        <p>
          The Service and all course and lecture content are provided "as is." We do not
          guarantee the accuracy, completeness, or educational outcome of any Teacher Content, and
          is not responsible for the conduct of teachers or students. We do not guarantee that the
          Service will be uninterrupted, error-free, or available at all times.
        </p>
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          To the fullest extent permitted by law, we will not be liable for any indirect,
          incidental, or consequential damages arising from your use of, or inability to use, the
          Service, including loss of access to purchased content due to an expired or revoked
          grant.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make a material change, we will
          update the "Last updated" date above. Continuing to use the Service after a change takes
          effect means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Governing law">
        <p>
          These Terms are governed by the laws of Pakistan, without regard to conflict-of-law
          principles. Any dispute arising from these Terms or your use of the Service will be
          subject to the exclusive jurisdiction of the courts of Pakistan.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          Questions about these Terms can be sent to Gilani School System, the operator of
          EduBeacon, at{' '}
          <a href="mailto:legal@edubeacon.com" className="text-purple-600 dark:text-purple-400 hover:underline">
            legal@edubeacon.com
          </a>
          .
        </p>
      </LegalSection>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        See also our{' '}
        <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalLayout>
  );
};

export default Terms;
