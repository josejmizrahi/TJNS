'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jewishIdApi, JewishIDData } from '../lib/api/jewish-id';
import { useRouter } from 'next/navigation';

export function useJewishID() {
  return useQuery<JewishIDData>({
    queryKey: ['jewish-id'],
    queryFn: jewishIdApi.getJewishID,
  });
}

export function useCreateJewishID() {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: jewishIdApi.createJewishID,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jewish-id'] });
      router.push('/verification');
    },
  });
}

export function useUpdateJewishID() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jewishIdApi.updateJewishID,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jewish-id'] });
    },
  });
}

export function useFamilyTree() {
  return useQuery({
    queryKey: ['family-tree'],
    queryFn: jewishIdApi.getFamilyTree,
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jewishIdApi.addFamilyMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree'] });
      queryClient.invalidateQueries({ queryKey: ['jewish-id'] });
    },
  });
}

export function useVerificationRequirements() {
  return useQuery({
    queryKey: ['verification-requirements'],
    queryFn: jewishIdApi.getVerificationRequirements,
  });
}
