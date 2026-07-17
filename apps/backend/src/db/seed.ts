import { db } from "./index.js";
import {
  roles,
  permissions,
  roleToPermissions,
  users,
  userToRoles,
  departments,
  projects,
  dictTypes,
  dictData,
} from "@forge/shared";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 开始播种数据库初始数据...");

  // 1. 清理现有表数据（级联删除关联关系）
  console.log("🧹 清理旧测试数据...");
  try {
    await db.delete(projects);
    await db.delete(userToRoles);
    await db.delete(roleToPermissions);
    await db.delete(users);
    await db.delete(roles);
    await db.delete(permissions);
    await db.delete(departments);
    await db.delete(dictData);
    await db.delete(dictTypes);
  } catch (err) {
    console.log("⚠️ 清理部分数据表失败（可能表不存在），继续播种...", err);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 2. 播种部门数据 (Departments)
  console.log("🏢 播种组织架构部门树...");
  // 级别 1
  const [dHeadquarter] = await db
    .insert(departments)
    .values({ name: "Forge集团总部", parentId: null })
    .returning();
  // 级别 2
  const [dRD] = await db
    .insert(departments)
    .values({ name: "研发中心", parentId: dHeadquarter.id })
    .returning();
  const [dSales] = await db
    .insert(departments)
    .values({ name: "销售中心", parentId: dHeadquarter.id })
    .returning();
  // 级别 3
  const [dRD1] = await db
    .insert(departments)
    .values({ name: "研发一组", parentId: dRD.id })
    .returning();
  const [dRDTest] = await db
    .insert(departments)
    .values({ name: "测试组", parentId: dRD.id })
    .returning();

  // 3. 播种用户数据 (Users)
  console.log("👤 播种系统用户...");
  const [uAdmin] = await db
    .insert(users)
    .values({
      username: "admin",
      password: hashedPassword,
      nickname: "超级管理员",
      status: "active",
      departmentId: dHeadquarter.id,
    })
    .returning();

  const [uRDLeader] = await db
    .insert(users)
    .values({
      username: "leader_rd",
      password: hashedPassword,
      nickname: "研发负责人",
      status: "active",
      departmentId: dRD.id,
    })
    .returning();

  const [uRDStaff1] = await db
    .insert(users)
    .values({
      username: "staff_rd1",
      password: hashedPassword,
      nickname: "研发一组开发小哥",
      status: "active",
      departmentId: dRD1.id,
    })
    .returning();

  const [uRDStaff2] = await db
    .insert(users)
    .values({
      username: "staff_rd2",
      password: hashedPassword,
      nickname: "测试小妹",
      status: "active",
      departmentId: dRDTest.id,
    })
    .returning();

  const [uSalesStaff] = await db
    .insert(users)
    .values({
      username: "staff_sales",
      password: hashedPassword,
      nickname: "销售大王",
      status: "active",
      departmentId: dSales.id,
    })
    .returning();

  // 3.1 增加 500 条随机用户测试数据
  console.log("👤 播种 500 条随机测试用户...");
  const mockUsers = [];
  const statusOptions = ["active", "disabled"];
  const deptIds = [dHeadquarter.id, dRD.id, dSales.id, dRD1.id, dRDTest.id];
  for (let i = 1; i <= 500; i++) {
    const deptId = deptIds[i % deptIds.length];
    mockUsers.push({
      username: `user_${i}`,
      password: hashedPassword,
      nickname: `测试用户_${i}`,
      status: statusOptions[i % 2],
      departmentId: deptId,
      createdAt: new Date(Date.now() - i * 60 * 60 * 1000), // 渐进时间方便测试排序
    });
  }

  const insertedUsers = [];
  const chunkSize = 100;
  for (let i = 0; i < mockUsers.length; i += chunkSize) {
    const chunk = mockUsers.slice(i, i + chunkSize);
    const results = await db
      .insert(users)
      .values(chunk as any)
      .returning({ id: users.id });
    insertedUsers.push(...results);
  }

  // 绑定部门负责人
  await db
    .update(departments)
    .set({ leaderUserId: uRDLeader.id })
    .where(eq(departments.id, dRD.id));

  // 4. 播种角色数据 (Roles)
  console.log("🎭 播种系统角色...");
  const [rSuperAdmin] = await db
    .insert(roles)
    .values({
      code: "ROLE_SUPER_ADMIN",
      name: "超级管理员",
      description: "拥有系统最高级别的全部操作和数据范围权限",
      dataScope: "all",
    })
    .returning();

  const [rDeptLeader] = await db
    .insert(roles)
    .values({
      code: "ROLE_DEPT_LEADER",
      name: "部门负责人",
      description: "拥有本部门及下属部门的数据查看权限",
      dataScope: "dept_child",
    })
    .returning();

  const [rStaff] = await db
    .insert(roles)
    .values({
      code: "ROLE_STAFF",
      name: "普通员工",
      description: "仅拥有本人数据范围权限",
      dataScope: "self",
    })
    .returning();

  // 5. 绑定用户与角色
  console.log("🔗 关联用户与角色...");
  await db.insert(userToRoles).values([
    { userId: uAdmin.id, roleId: rSuperAdmin.id },
    { userId: uRDLeader.id, roleId: rDeptLeader.id },
    { userId: uRDStaff1.id, roleId: rStaff.id },
    { userId: uRDStaff2.id, roleId: rStaff.id },
    { userId: uSalesStaff.id, roleId: rStaff.id },
  ]);

  console.log("🔗 关联 500 条测试账号与角色...");
  const userRoleMappings = insertedUsers.map((u) => ({
    userId: u.id,
    roleId: rStaff.id,
  }));
  for (let i = 0; i < userRoleMappings.length; i += chunkSize) {
    const chunk = userRoleMappings.slice(i, i + chunkSize);
    await db.insert(userToRoles).values(chunk);
  }

  // 6. 播种权限 (Permissions)
  console.log("🔑 播种功能权限...");
  const [pAdmin] = await db
    .insert(permissions)
    .values({
      code: "sys:admin",
      name: "系统最高管理权限",
      type: "catalogue",
    } as any)
    .returning();

  // 关联超级管理员角色的权限
  await db.insert(roleToPermissions).values({
    roleId: rSuperAdmin.id,
    permissionId: pAdmin.id,
  });

  // 7. 播种示例业务项目表数据 (Projects)
  console.log("📁 播种测试业务项目数据...");
  await db.insert(projects).values([
    { name: "总部核心集团规划项目", creatorId: uAdmin.id, departmentId: dHeadquarter.id },
    { name: "研发中心架构升级预研", creatorId: uRDLeader.id, departmentId: dRD.id },
    { name: "研发一组 Forge Admin 2.0 研发任务", creatorId: uRDStaff1.id, departmentId: dRD1.id },
    { name: "测试组 UI 自动化回归测试平台", creatorId: uRDStaff2.id, departmentId: dRDTest.id },
    {
      name: "销售部 2026 年度大宗签约合同项目",
      creatorId: uSalesStaff.id,
      departmentId: dSales.id,
    },
  ]);

  // 8. 播种系统数据字典 (Dictionaries)
  console.log("📘 播种系统数据字典...");
  // 字典类型 1：性别
  await db.insert(dictTypes).values({
    name: "用户性别",
    type: "sys_user_sex",
    status: "active",
    description: "用户性别字典列表",
  });
  await db.insert(dictData).values([
    {
      dictType: "sys_user_sex",
      label: "未知",
      value: "0",
      sort: 1,
      listClass: "info",
      status: "active",
    },
    {
      dictType: "sys_user_sex",
      label: "男",
      value: "1",
      sort: 2,
      listClass: "primary",
      status: "active",
    },
    {
      dictType: "sys_user_sex",
      label: "女",
      value: "2",
      sort: 3,
      listClass: "success",
      status: "active",
    },
  ]);

  // 字典类型 2：状态
  await db.insert(dictTypes).values({
    name: "系统状态",
    type: "sys_status",
    status: "active",
    description: "系统通用启用禁用状态列表",
  });
  await db.insert(dictData).values([
    {
      dictType: "sys_status",
      label: "正常",
      value: "active",
      sort: 1,
      listClass: "success",
      status: "active",
    },
    {
      dictType: "sys_status",
      label: "禁用",
      value: "disabled",
      sort: 2,
      listClass: "danger",
      status: "active",
    },
  ]);

  console.log("🎉 数据库初始数据播种成功！测试账户密码统一为: admin123");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ 数据库播种失败:", err);
  process.exit(1);
});
