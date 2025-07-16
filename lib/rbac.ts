export enum UserRole {
  FREE = 'free',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

export enum Permission {
  // Chat permissions
  CHAT_BASIC = 'chat:basic',
  CHAT_ADVANCED = 'chat:advanced',
  CHAT_UNLIMITED = 'chat:unlimited',
  
  // Document permissions
  DOCUMENT_READ = 'document:read',
  DOCUMENT_WRITE = 'document:write',
  DOCUMENT_DELETE = 'document:delete',
  DOCUMENT_SHARE = 'document:share',
  
  // File permissions
  FILE_UPLOAD = 'file:upload',
  FILE_UPLOAD_LARGE = 'file:upload_large',
  
  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_SYSTEM = 'admin:system',
  ADMIN_ANALYTICS = 'admin:analytics',
  
  // Payment permissions
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_MANAGE = 'payment:manage',
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.FREE]: [
    Permission.CHAT_BASIC,
    Permission.DOCUMENT_READ,
    Permission.FILE_UPLOAD,
  ],
  [UserRole.PREMIUM]: [
    Permission.CHAT_BASIC,
    Permission.CHAT_ADVANCED,
    Permission.CHAT_UNLIMITED,
    Permission.DOCUMENT_READ,
    Permission.DOCUMENT_WRITE,
    Permission.DOCUMENT_DELETE,
    Permission.DOCUMENT_SHARE,
    Permission.FILE_UPLOAD,
    Permission.FILE_UPLOAD_LARGE,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_MANAGE,
  ],
  [UserRole.ADMIN]: [
    ...Object.values(Permission), // All permissions
  ],
};

export function getUserRole(hasAccess: boolean, isAdmin: boolean = false): UserRole {
  if (isAdmin) return UserRole.ADMIN;
  if (hasAccess) return UserRole.PREMIUM;
  return UserRole.FREE;
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function checkPermission(userRole: UserRole, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }
}

// Usage limits based on role
export const USAGE_LIMITS = {
  [UserRole.FREE]: {
    messagesPerDay: 50,
    documentsMax: 10,
    fileUploadSizeMB: 10,
    filesPerDay: 5,
  },
  [UserRole.PREMIUM]: {
    messagesPerDay: -1, // unlimited
    documentsMax: -1, // unlimited
    fileUploadSizeMB: 100,
    filesPerDay: 100,
  },
  [UserRole.ADMIN]: {
    messagesPerDay: -1, // unlimited
    documentsMax: -1, // unlimited
    fileUploadSizeMB: 500,
    filesPerDay: -1, // unlimited
  },
};

export function getUsageLimit(userRole: UserRole, limitType: keyof typeof USAGE_LIMITS[UserRole]): number {
  return USAGE_LIMITS[userRole][limitType];
}

export function isUsageLimitReached(
  userRole: UserRole,
  limitType: keyof typeof USAGE_LIMITS[UserRole],
  currentUsage: number
): boolean {
  const limit = getUsageLimit(userRole, limitType);
  return limit !== -1 && currentUsage >= limit;
}