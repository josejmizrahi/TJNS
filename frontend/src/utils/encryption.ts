import { ClientEncryption } from './client-encryption';

export { ClientEncryption };
export default ClientEncryption;
export const encryptData = ClientEncryption.encryptData;
export const decryptData = ClientEncryption.decryptData;
