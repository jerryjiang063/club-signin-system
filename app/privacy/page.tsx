"use client";

import { LayoutWrapper } from "@/components/layout-wrapper";
import { FadeIn } from "@/components/animations";
import { FiCheck } from "react-icons/fi";
import Link from "next/link";

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

        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="space-y-8">
              {/* Introduction */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to the In-Class Gardening Club's Privacy Policy. This document explains how we collect, use, and protect your personal information when you use our website and services.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect the following types of information:
                </p>
                <div className="space-y-3">
                  <div className="pl-4 border-l-2 border-primary/30">
                    <h3 className="font-semibold mb-1">Personal Information</h3>
                    <p className="text-muted-foreground text-sm">
                      Name, email address, and profile information you provide during registration.
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-primary/30">
                    <h3 className="font-semibold mb-1">Usage Data</h3>
                    <p className="text-muted-foreground text-sm">
                      Information about how you interact with our website, including login times, plant check-ins, and feature usage.
                    </p>
                  </div>
                  <div className="pl-4 border-l-2 border-primary/30">
                    <h3 className="font-semibold mb-1">Images</h3>
                    <p className="text-muted-foreground text-sm">
                      Photos you upload as part of plant check-ins.
                    </p>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To provide and maintain our service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To notify you about changes to our service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To allow you to participate in interactive features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To provide customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To gather insights and improve our service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To send you reminders about plant care responsibilities</span>
                  </li>
                </ul>
              </section>

              {/* Data Security */}
              <section className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  The security of your data is important to us. We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Sharing */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Data Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not share your personal information with third parties except in the following cases:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">With your consent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">For educational purposes within our school</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">To comply with legal obligations</span>
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  You have the right to:
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Access your personal data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Correct inaccurate data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Request deletion of your data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Object to processing of your data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Request restriction of processing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FiCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Request transfer of your data</span>
                  </div>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="card p-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our service is intended for use by students in our school. We do not knowingly collect personally identifiable information from anyone under 13 years of age without parental consent.
                </p>
              </section>

              {/* Changes to This Privacy Policy */}
              <section className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                </p>
              </section>

              {/* Contact Us */}
              <section className="card p-6 bg-primary/5 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> inclassgardening@outlook.com
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Location:</strong> Room 320
                  </p>
                  <p className="text-muted-foreground">
                    Or visit our <Link href="/contact" className="text-primary hover:underline font-medium">Contact Page</Link>
                  </p>
                </div>
              </section>
            </div>
          </FadeIn>
        </div>
      </div>
    </LayoutWrapper>
  );
}
