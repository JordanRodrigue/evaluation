export type FhevmLoadSDKType = () => Promise<boolean>;
export type FhevmInitSDKOptions = object | undefined;

export type FhevmWindowType = Window & {
  relayerSDK: any & {
    __initialized__?: boolean;
    SepoliaConfig: {
      aclContractAddress: `0x${string}`;
      gatewayChainId: number;
      kmsContractAddress: `0x${string}`;
      inputVerifierContractAddress: `0x${string}`;
    };
    initSDK: (options?: FhevmInitSDKOptions) => Promise<boolean>;
    createInstance: (config: any) => Promise<any>;
  };
};


