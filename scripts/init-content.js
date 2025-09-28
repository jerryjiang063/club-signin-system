const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const defaultContents = [
    {
      key: 'home_hero',
      title: 'Growing Together,Blooming Knowledge',
      content: 'Welcome to our In-Class Gardening Club platform. Track plant care, share your gardening journey, and learn together in our green community.',
      imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80',
    },
    {
      key: 'features_title',
      title: 'How Our Club Works',
      content: 'A simple and effective way to manage plant care in our community',
      imageUrl: null,
    },
    {
      key: 'benefits_title',
      title: 'Benefits of Our Platform',
      content: 'Why our gardening club platform makes plant care easier and more enjoyable',
      imageUrl: null,
    },
    {
      key: 'cta_section',
      title: 'Ready to Join Our Gardening Community?',
      content: 'Sign up today and start your plant care journey with our in-class gardening club.',
      imageUrl: null,
    },
    {
      key: 'about_hero',
      title: 'About Our Gardening Club',
      content: 'Learn more about our mission, history, and the people behind our in-class gardening initiative.',
      imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    },
    {
      key: 'contact_info',
      title: 'Contact Us',
      content: 'Have questions about our gardening club? We\'re here to help! Send us a message and we\'ll get back to you as soon as possible.',
      imageUrl: null,
    },
    {
      key: 'privacy_content',
      title: 'Privacy Policy',
      content: 'This is our privacy policy that explains how we collect, use, and protect your personal information when you use our website and services.',
      imageUrl: null,
    },
  ];

  for (const content of defaultContents) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    });
  }
  console.log('网站内容初始化完成');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });