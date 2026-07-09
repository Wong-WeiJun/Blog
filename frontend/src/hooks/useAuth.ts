import {
  loginRecoverPassword,
  loginResetPassword,
  loginLogout,
  type BodyLoginLoginAccessToken,
  type UserPublic,
  type UserRegister,
  usersReadUserMe,
  usersRegisterUser,
  loginLoginAccessToken,
} from "@/client";
import { client } from "@/client/client.gen";
import { handleError } from "@/lib/api";
import useCustomToast from "./useCustomToast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null;
};

const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showErrorToast } = useCustomToast();

  const {
    data: user,
    isLoading,
    isFetching,
  } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await usersReadUserMe({ throwOnError: true });
      return response.data;
    },
    enabled: isLoggedIn(),
  });

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      usersRegisterUser({ body: data, throwOnError: true }),
    onSuccess: () => {
      navigate("/auth");
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const login = async (data: BodyLoginLoginAccessToken) => {
    const response = await loginLoginAccessToken({
      body: data,
      throwOnError: true,
    });
    const token = response.data.access_token;
    localStorage.setItem("access_token", token);
    client.setConfig({
      auth: () => token,
    });
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/");
    },
    onError: handleError.bind(showErrorToast),
  });

  const logout = () => {
    const doLogout = async () => {
      try {
        if (isLoggedIn()) {
          await loginLogout({ throwOnError: true });
        }
      } catch {
        // Legacy tokens without a session id may not revoke server-side.
      } finally {
        localStorage.removeItem("access_token");
        client.setConfig({
          auth: () => undefined,
        });
        queryClient.clear();
        navigate("/");
      }
    };
    void doLogout();
  };

  const recoverPasswordMutation = useMutation({
    mutationFn: (email: string) =>
      loginRecoverPassword({
        path: { email },
        throwOnError: true,
      }),
    onError: handleError.bind(showErrorToast),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      loginResetPassword({
        body: { token, new_password: newPassword },
        throwOnError: true,
      }),
    onError: handleError.bind(showErrorToast),
  });

  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  };

  return {
    signUpMutation,
    loginMutation,
    recoverPasswordMutation,
    resetPasswordMutation,
    logout,
    refreshUser,
    user: user ?? null,
    isLoading: isLoading || isFetching,
  };
};

export { isLoggedIn };
export default useAuth;
