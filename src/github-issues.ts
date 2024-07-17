/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios"
import { z } from "zod"
import type Express from "express"
import { transact } from "./pg.js"

const BASEURL=process.env.GITHUB_API_BASEURL

const GRAPHQL_ENDPOINT=process.env.GITHUB_API_GRAPHQL
console.log("GRAPHQL_ENDPOINT",GRAPHQL_ENDPOINT)
const headers={
    "Content-Type":"application/json",
    Accept : "application/vnd.github+json",
    Authorization : `Bearer ${process.env.GITHUB_PAT}`
}
const apiInstance=axios.create({
    baseURL:BASEURL,
    headers,
})

export const createIssueSchema = z.object({
    title: z.string(),
    body: z.string(),
    assignees: z.array(z.string()),
    labels: z.array(z.string())
  })
  
export const createIssue=async ({title, labels}:{title:string, labels:string[]})=>{
    let response
    console.log("Line28")
    try{
        response = await apiInstance.post("/issues", {
             title,
             body: "I'm having a problem with this.",
             assignees:[
                 "nishanthbhat07"
             ], 
             labels,
         })
         console.info("CREATED ISSUE")
    }
    catch(e){
        // throw new Error("ERROR while creating issue\n"+e)
        console.log("Errrr", e);
    }

    return {response:response?.data,issueNumber: response?.data?.number, github_node_id:response?.data?.node_id}
}
export const updateIssue=async ({title, issueNumber, state}:{title:string, issueNumber:string, state:"open" | "closed" | undefined})=>{
    let response
    console.log("Line47")
    try{
        response = await apiInstance.patch(`/issues/${issueNumber}`, {
             title,
             state: state || "open",
         })
         console.info("UPDATED ISSUE")
        //  console.log("Line54", response)
    }
    catch(e){
        // throw new Error("ERROR while updating issue\n"+e)
        console.log("Errrr", e);
    }

   return {response:response?.data, issueNumber: response?.data?.number, github_node_id: response?.data?.node_id}
}
export const deleteIssue=async ({node_id}:{node_id:string | null |undefined, })=>{
    console.log("Line64",node_id)
    const gql={
        query:`
        mutation DeleteIssue($issueId: ID!){
            deleteIssue(input:{issueId:$issueId}){
                clientMutationId
            }
        }
        `,
        variables:{
            issueId: node_id
        }
    }
    let response
    try{
        response = await axios.post("",gql, {
            baseURL:GRAPHQL_ENDPOINT,
            headers
        })
        console.log("Line79", response.data.errors)
         console.info("DELETED ISSUE")
    }
    catch(e){
        // throw new Error("ERROR while delete issue\n"+e)
        console.log("Errrr", e);
    }

    return {response: response.data?.data?.deleteIssue?.clientMutationId}
}

export const handleSyncIusses= async (req: Express.Request, res: Express.Response)=>{
    const {number, state, title}=req.body;
    try{
        await transact(async (executor) => {
          const data= await  executor.todo.findFirst({
                where:{
                    githubIssueNumber: Number(number)
                }
            })
            if(!data?.id){
               return res.status(200)
            }

            const dataFromReplicache=await executor.replicacheEntry.findFirst({
                where:{
                    key:`todo/${data?.id}`
                }
            })
            const updatedValues={
             ...JSON.parse(dataFromReplicache?.value || "{}"),
             completed:    state ==="open" ? false :true,
             title,
            }
            
            return await Promise.all([
                executor.todo.updateMany({
                    where:{
                        githubIssueNumber: Number(number)
                    },
                    data:{
                        completed: state ==="open" ? false :true,
                        title,
                    }
                }),
                executor.replicacheEntry.update({
                    where:{
                        spaceID_key:{
                            key: `todo/${data?.id}`,
                            spaceID: dataFromReplicache?.spaceID || ""
                        }
                    },
                    data:{
                        value: JSON.stringify(updatedValues)
                    }
                })
            ])
        })

        return res.status(204);
    }
    catch(e){
        // throw new Error("CANNOT SYNC\n"+e);
        console.log("Errrr", e);
    }
}