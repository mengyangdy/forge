import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 1. 部门组织架构表
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  parentId: integer("parent_id").references((): any => departments.id, {
    onDelete: "cascade",
  }),
  leaderUserId: integer("leader_user_id").references((): any => users.id, {
    onDelete: "set null",
  }),
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. 用户表
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // 存储 bcryptjs 加密后的哈希值
  nickname: text("nickname"),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 11 }).unique(),
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. 角色表（扩展数据权限 dataScope 属性）
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  dataScope: text("data_scope").default("self").notNull(), // 'all' | 'dept_child' | 'dept' | 'self' | 'custom'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. 权限表
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type", { enum: ["menu", "button", "catalogue"] }).notNull(), // 例如 'menu', 'button'
  parentId: integer("parent_id").references((): any => permissions.id, {
    onDelete: "cascade",
  }),
  routeName: text("route_name"),
  routePath: text("route_path"),
  component: text("component"),
  pathParam: text("path_param"),
  i18nKey: text("i18n_key"),
  order: integer("order").default(0).notNull(),
  iconType: text("icon_type").default("iconify").notNull(), // 'iconify' | 'local'
  icon: text("icon"),
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. 用户与角色映射表
export const userToRoles = pgTable(
  "user_to_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.roleId] }), // 联合主键防止重复绑定
  ],
);

// 6. 角色与权限映射表
export const roleToPermissions = pgTable(
  "role_to_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissionId] }), // 联合主键
  ],
);

// 7. 角色与自定义部门权限范围映射表 (当 dataScope = 'custom' 时起效)
export const roleToCustomDepts = pgTable(
  "role_to_custom_depts",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    deptId: integer("dept_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.deptId] })],
);

// 8. 示例业务项目数据表（用于测试行级数据隔离权限）
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =================== 关系定义 (Relations) ===================

// 部门关系
export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parent: one(departments, {
    fields: [departments.parentId],
    references: [departments.id],
    relationName: "dept_parent",
  }),
  children: many(departments, { relationName: "dept_parent" }),
  leader: one(users, {
    fields: [departments.leaderUserId],
    references: [users.id],
  }),
  users: many(users),
  projects: many(projects),
}));

// 用户与其角色、部门、项目的关系
export const usersRelations = relations(users, ({ one, many }) => ({
  userToRoles: many(userToRoles),
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  projects: many(projects),
}));

// 角色与权限、部门、用户映射
export const rolesRelations = relations(roles, ({ many }) => ({
  userToRoles: many(userToRoles),
  roleToPermissions: many(roleToPermissions),
  roleToCustomDepts: many(roleToCustomDepts),
}));

// 权限关系
export const permissionsRelations = relations(permissions, ({ many }) => ({
  roleToPermissions: many(roleToPermissions),
}));

// 用户角色中间表桥梁
export const userToRolesRelations = relations(userToRoles, ({ one }) => ({
  user: one(users, { fields: [userToRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userToRoles.roleId], references: [roles.id] }),
}));

// 角色权限中间表桥梁
export const roleToPermissionsRelations = relations(roleToPermissions, ({ one }) => ({
  role: one(roles, {
    fields: [roleToPermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [roleToPermissions.permissionId],
    references: [permissions.id],
  }),
}));

// 角色自定义部门权限中间表桥梁
export const roleToCustomDeptsRelations = relations(roleToCustomDepts, ({ one }) => ({
  role: one(roles, {
    fields: [roleToCustomDepts.roleId],
    references: [roles.id],
  }),
  department: one(departments, {
    fields: [roleToCustomDepts.deptId],
    references: [departments.id],
  }),
}));

// 项目数据关系桥梁
export const projectsRelations = relations(projects, ({ one }) => ({
  creator: one(users, { fields: [projects.creatorId], references: [users.id] }),
  department: one(departments, {
    fields: [projects.departmentId],
    references: [departments.id],
  }),
}));

// =================== 推导并强导出全栈 TypeScript 类型 ===================
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// =================== Zod 校验 Schemas ===================
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(2, "用户名最少 2 个字符").max(50),
  password: z.string().min(6, "密码最少 6 位"),
  nickname: z.string().max(50).nullable(),
  departmentId: z.number().int().positive("所属部门不能为空"),
});
export const selectUserSchema = createSelectSchema(users);

export const insertRoleSchema = createInsertSchema(roles);
export const selectRoleSchema = createSelectSchema(roles);

export const insertPermissionSchema = createInsertSchema(permissions);
export const selectPermissionSchema = createSelectSchema(permissions);

export const insertDepartmentSchema = createInsertSchema(departments);
export const selectDepartmentSchema = createSelectSchema(departments);

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);

// 专门用于登录校验的 Schema，前后端共用
export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// =================== 操作审计与访问日志定义 ===================
// 操作审计日志表
export const operationLogs = pgTable("operation_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  username: text("username"),
  nickname: text("nickname"),
  ip: text("ip"),
  method: text("method").notNull(),
  url: text("url").notNull(),
  module: text("module"),
  action: text("action"),
  requestParams: text("request_params"),
  responseData: text("response_data"),
  status: integer("status").notNull(),
  duration: integer("duration").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const operationLogsRelations = relations(operationLogs, ({ one }) => ({
  user: one(users, { fields: [operationLogs.userId], references: [users.id] }),
}));

export type OperationLog = typeof operationLogs.$inferSelect;
export type NewOperationLog = typeof operationLogs.$inferInsert;

// 系统访问日志表
export const accessLogs = pgTable("access_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  username: text("username"),
  ip: text("ip"),
  method: text("method").notNull(),
  url: text("url").notNull(),
  requestParams: text("request_params"),
  responseData: text("response_data"),
  status: integer("status").notNull(),
  duration: integer("duration").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  user: one(users, { fields: [accessLogs.userId], references: [users.id] }),
}));

export type AccessLog = typeof accessLogs.$inferSelect;
export type NewAccessLog = typeof accessLogs.$inferInsert;

// 字典类型表
export const dictTypes = pgTable("sys_dict_type", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().unique(), // e.g. "sys_user_sex"
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  isSystem: text("is_system").default("N").notNull(), // 是否系统内置 'Y' | 'N'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 字典数据表
export const dictData = pgTable("sys_dict_data", {
  id: serial("id").primaryKey(),
  dictType: text("dict_type").notNull(),
  label: text("label").notNull(), // '男'
  value: text("value").notNull(), // '1'
  sort: integer("sort").default(0).notNull(),
  listClass: text("list_class"), // 'primary' | 'success' | 'warning' | 'danger' | 'info'
  isDefault: text("is_default").default("N").notNull(), // 是否默认选中 'Y' | 'N'
  cssClass: text("css_class"), // 自定义 CSS 样式类名
  status: text("status").default("active").notNull(), // 'active' | 'disabled'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dictTypesRelations = relations(dictTypes, ({ many }) => ({
  data: many(dictData),
}));

export const dictDataRelations = relations(dictData, ({ one }) => ({
  type: one(dictTypes, {
    fields: [dictData.dictType],
    references: [dictTypes.type],
  }),
}));

export type DictType = typeof dictTypes.$inferSelect;
export type NewDictType = typeof dictTypes.$inferInsert;

export type DictData = typeof dictData.$inferSelect;
export type NewDictData = typeof dictData.$inferInsert;

export const insertDictTypeSchema = createInsertSchema(dictTypes);
export const selectDictTypeSchema = createSelectSchema(dictTypes);

export const insertDictDataSchema = createInsertSchema(dictData);
export const selectDictDataSchema = createSelectSchema(dictData);

// 系统文件存储记录表
export const sysFiles = pgTable("sys_files", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(), // 文件 MD5 唯一哈希值，用于秒传校验
  filename: text("filename").notNull(), // 原始文件名
  url: text("url").notNull(), // 可访问的 URL
  size: integer("size").notNull(), // 文件大小（字节）
  mimeType: text("mime_type"), // MIME 类型，如 image/png, video/mp4
  provider: text("provider").notNull(), // 存储商：local, alioss
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SysFile = typeof sysFiles.$inferSelect;
export type NewSysFile = typeof sysFiles.$inferInsert;

// 系统动态配置表 (用于存储引擎配置、系统设置等)
export const sysConfigs = pgTable("sys_config", {
  id: serial("id").primaryKey(),
  configKey: text("config_key").notNull().unique(), // e.g. "sys:storage:config"
  configValue: text("config_value").notNull(), // JSON 字符串
  remark: text("remark"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SysConfig = typeof sysConfigs.$inferSelect;
export type NewSysConfig = typeof sysConfigs.$inferInsert;

export const insertSysFileSchema = createInsertSchema(sysFiles);
export const selectSysFileSchema = createSelectSchema(sysFiles);
