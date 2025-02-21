'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jewishIdApi, JewishIDData } from '../lib/api/jewish-id';
import { useRouter } from 'next/navigation';

interface FamilyMemberData {
  relation: 'mother' | 'father' | 'child';
  memberId: string;
  documents?: Array<{ type: string; file: Buffer }>;
}

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

interface AddFamilyMemberParams {
  identityId: string;
  memberData: {
    relation: 'mother' | 'father' | 'child';
    memberId: string;
    documents?: Array<{ type: string; file: Buffer }>;
  };
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, AddFamilyMemberParams>({
    mutationFn: ({ identityId, memberData }) => 
      jewishIdApi.addFamilyMember(identityId, memberData.relation, memberData.memberId, memberData.documents),
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
