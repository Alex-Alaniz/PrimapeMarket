import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const contractAddress = "0x5Eb0aFd6CED124348eD44BDB955E26Ccb8fA613C";

export const contract = getContract({
    client: client,
    chain: defineChain(33139),
    address: contractAddress,
});
