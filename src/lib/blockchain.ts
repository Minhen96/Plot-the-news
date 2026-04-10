// Shell stubs — implement with ethers.js when blockchain integration is ready

export function hashPrediction(
  storyId: string,
  optionId: string,
  userAddress: string,
  timestamp: number
): string {
  return `0x${Buffer.from(`${storyId}:${optionId}:${userAddress}:${timestamp}`).toString('hex').slice(0, 64)}`;
}

export function hashStory(storyId: string): string {
  return `0x${Buffer.from(storyId).toString('hex').padStart(64, '0')}`;
}
