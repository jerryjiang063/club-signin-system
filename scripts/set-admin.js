const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 更新指定邮箱的用户为管理员
  const email = '2880931@learn.vsb.bc.ca';
  
  // 检查用户是否存在
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!existingUser) {
    console.log(`用户 ${email} 不存在，请先注册账户`);
    return;
  }
  
  // 更新用户角色为 ADMIN
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  
  console.log(`已成功将 ${updatedUser.name} (${updatedUser.email}) 设置为管理员`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
