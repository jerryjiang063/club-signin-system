"use client";

import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";

export default function PrivacyPage() {
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12">
        <FadeIn className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Last updated: September 28, 2025
          </p>
        </FadeIn>

        <div className="max-w-3xl mx-auto">
          <FadeIn className="prose dark:prose-invert max-w-none">
            <h2>Introduction</h2>
            <p>
              Welcome to the In-Class Gardening Club's Privacy Policy. This document explains how we collect, use, and protect your personal information when you use our website and services.
            </p>

            <h2>Information We Collect</h2>
            <p>
              We collect the following types of information:
            </p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, and profile information you provide during registration.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website, including login times, plant check-ins, and feature usage.</li>
              <li><strong>Images:</strong> Photos you upload as part of plant check-ins.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>
              We use your information for the following purposes:
            </p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To send you reminders about plant care responsibilities</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              The security of your data is important to us. We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2>Data Sharing</h2>
            <p>
              We do not share your personal information with third parties except in the following cases:
            </p>
            <ul>
              <li>With your consent</li>
              <li>For educational purposes within our school</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request restriction of processing your data</li>
              <li>Request transfer of your data</li>
            </ul>

            <h2>Children's Privacy</h2>
            <p>
              Our service is intended for use by students in our school. We do not knowingly collect personally identifiable information from anyone under 13 years of age without parental consent.
            </p>

            <h2>Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul>
              <li>By email: gardening.club@school.edu</li>
              <li>By visiting the contact page on our website: <a href="/contact">Contact Us</a></li>
            </ul>
          </FadeIn>
        </div>
      </div>
    </LayoutWrapper>
  );
}
