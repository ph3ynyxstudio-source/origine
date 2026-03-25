import { useQueryClient } from "@tanstack/react-query";
import { 
  useCreateMood, 
  useUpdateMood, 
  useDeleteMood,
  useLogin,
  useRegister,
  useLogout,
  getGetMeQueryKey,
  getListMoodsQueryKey
} from "@workspace/api-client-react";

// Wrapper hooks to handle cache invalidation automatically
export function useAppAuth() {
  const queryClient = useQueryClient();

  const login = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    }
  });

  const register = useRegister({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      }
    }
  });

  const logout = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.clear();
      }
    }
  });

  return { login, register, logout };
}

export function useAppMoods() {
  const queryClient = useQueryClient();

  const createMood = useCreateMood({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      }
    }
  });

  const updateMood = useUpdateMood({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      }
    }
  });

  const deleteMood = useDeleteMood({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      }
    }
  });

  return { createMood, updateMood, deleteMood };
}
