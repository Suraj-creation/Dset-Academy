import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

let _client: ContainerClient | null = null;

function getContainer(): ContainerClient {
  if (_client) return _client;
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set');
  const container = process.env.AZURE_STORAGE_CONTAINER ?? 'uploads';
  _client = BlobServiceClient.fromConnectionString(connStr).getContainerClient(container);
  return _client;
}

export async function uploadBlob(
  buffer: Buffer,
  blobName: string,
  contentType: string,
): Promise<string> {
  const client = getContainer();
  await client.createIfNotExists({ access: 'blob' });
  const block = client.getBlockBlobClient(blobName);
  await block.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return block.url;
}

export async function deleteBlob(url: string): Promise<void> {
  try {
    if (!url.startsWith('https://')) return; // local file — skip
    const container = process.env.AZURE_STORAGE_CONTAINER ?? 'uploads';
    const blobName = new URL(url).pathname.replace(`/${container}/`, '');
    await getContainer().deleteBlob(blobName, { deleteSnapshots: 'include' });
  } catch {}
}
