import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

import {
  type BodyLoginLoginAccessToken,
  loginLoginAccessToken,
  loginRecoverPassword,
  type UserPublic,
  type UserRegister,
  usersReadUserMe,
  usersRegisterUser,
} from "@/client";
import { client } from "@/client/client.gen";
import { handleError } from "@/lib/api";
import useCustomToast from "./useCustomToast";

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null;
};

const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showErrorToast } = useCustomToast();

  const { data: user } = useQuery<UserPublic | null, Error>({
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
    // Re-configure the client with the new token for all future requests
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
    localStorage.removeItem("access_token");
    client.setConfig({
      auth: () => undefined,
    });
    queryClient.clear();
    navigate("/");
  };

  const recoverPasswordMutation = useMutation({
    mutationFn: (email: string) =>
      loginRecoverPassword({
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
    logout,
    refreshUser,
    user: user ?? null,
    isLoading: false,
  };
};

export { isLoggedIn };
export default useAuth;
