export function getRolePermissions(roles, roleName) {
  const foundRole = roles.find((role) => role.name === roleName);

  return foundRole?.permissions || {};
}

export function canAccess(roles, roleName, moduleName, action = "view") {
  const permissions = getRolePermissions(roles, roleName);
  const modulePermissions = permissions[moduleName.toLowerCase()];

  if (!modulePermissions) return false;

  return Boolean(modulePermissions[action]);
}
