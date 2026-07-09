import {
  loginRecoverPassword,
  loginResetPassword,
  loginLogout,
  loginVerifyEmail,
  loginResendVerificationEmail,
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
import { AxiosError } from "axios";

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null;
};

const clearStoredAuth = () => {
  localStorage.removeItem("access_token");
  client.setConfig({
    auth: () => undefined,
  });
};

const isAuthFailure = (error: unknown) => {
  const status = (error as AxiosError)?.response?.status;
  return status === 401 || status === 403 || status === 404;
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
      try {
        const response = await usersReadUserMe({ throwOnError: true });
        return response.data;
      } catch (error) {
        if (isAuthFailure(error)) {
          clearStoredAuth();
        }
        throw error;
      }
    },
    enabled: isLoggedIn(),
    retry: false,
  });

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      usersRegisterUser({ body: data, throwOnError: true }),
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
        clearStoredAuth();
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

  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) =>
      loginVerifyEmail({
        body: { token },
        throwOnError: true,
      }),
    onError: handleError.bind(showErrorToast),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) =>
      loginResendVerificationEmail({
        path: { email },
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
    verifyEmailMutation,
    resendVerificationMutation,
    logout,
    refreshUser,
    user: user ?? null,
    isLoading: isLoading || isFetching,
  };
};

export { isLoggedIn };
export default useAuth;
