import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const contractAddress = "0xc9b6635F760a4B0960f6c1d37825E58D89Eeb566";

export const contract = getContract({
    client: client,
    chain: defineChain(33139),
    address: contractAddress
});