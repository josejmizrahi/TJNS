import { apiClient } from '../api-client';

export interface JewishIDData {
  hebrewName: string;
  englishName: string;
  dateOfBirth: string;
  motherHebrewName?: string;
  fatherHebrewName?: string;
  communityAffiliation?: string;
  rabbiReference?: string;
}

export const jewishIdApi = {
  createJewishID: async (data: JewishIDData) => {
    const { data: response } = await apiClient.post('/identity/jewish-id', data);
    return response;
  },

  getJewishID: async () => {
    const { data } = await apiClient.get('/identity/jewish-id');
    return data;
  },

  updateJewishID: async (data: Partial<JewishIDData>) => {
    const { data: response } = await apiClient.patch('/identity/jewish-id', data);
    return response;
  },

  getVerificationRequirements: async () => {
    const { data } = await apiClient.get('/identity/verification-requirements');
    return data;
  },

  getFamilyTree: async () => {
    const { data } = await apiClient.get('/identity/family-tree');
    return data;
  },

  addFamilyMember: async (identityId: string, relation: 'mother' | 'father' | 'child', memberId: string, documents?: Array<{ type: string; file: Buffer }>) => {
    const formData = new FormData();
    formData.append('relation', relation);
    formData.append('memberId', memberId);
    
    if (documents) {
      documents.forEach((doc, index) => {
        formData.append(`document_${index}`, new Blob([doc.file]), doc.type);
      });
    }

    const { data } = await apiClient.post(`/identity/jewish-id/${identityId}/family-member`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
