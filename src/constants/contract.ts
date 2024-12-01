import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

export const contractAddress = "0xa55e582b70B3372f531Dc5ed579B248d356B9840";
export const tokenAddress = "0x173c93e5DD071F4EDbc52f1BA22C014D34CFEf5e";

export const contract = getContract({
    client: client,
    chain: defineChain(33139),
    address: contractAddress
});

export const tokenContract = getContract({
    client: client,
    chain: defineChain(33139),
    address: tokenAddress
});