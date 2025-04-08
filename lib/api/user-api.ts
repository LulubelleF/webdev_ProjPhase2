// Types for user data
export type User = {
  id: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  roleLevel: string;
  dateCreated: Date | string;
  lastLogin: Date | string | null;
  activeStatus: boolean;
  createdBy: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// Function to fetch users with optional filtering
export async function fetchUsers(
  params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<PaginatedResponse<User>> {
  const queryParams = new URLSearchParams();

  // Add any provided parameters to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`/api/users?${queryParams.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch users");
  }

  const data = await response.json();
  return {
    data: data.users,
    pagination: data.pagination,
  };
}

// Function to fetch a single user by ID
export async function fetchUserById(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch user");
  }

  return response.json();
}

// Function to create a new user
export async function createUser(data: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  roleLevel: string;
  activeStatus?: boolean;
}): Promise<User> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create user");
  }

  return response.json();
}

// Function to update a user
export async function updateUser(
  id: string,
  data: {
    email?: string;
    fullName?: string;
    roleLevel?: string;
    activeStatus?: boolean;
  }
): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user");
  }

  return response.json();
}

// Function to delete a user
export async function deleteUser(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete user");
  }

  return response.json();
}

// Function to reset a user's password
export async function resetUserPassword(
  id: string,
  password: string
): Promise<{ message: string }> {
  const response = await fetch(`/api/users/${id}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reset password");
  }

  return response.json();
}
