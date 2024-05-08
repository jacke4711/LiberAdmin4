import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages.js";
import { getWeather } from './functions/weather'


const apiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: `${apiKey}` });

export enum Role {
    user, assistant
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    threadId: string;
}

class OpenAIMessage implements Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    threadId: string;



    constructor(message: OpenAI.Beta.Threads.Messages.Message) {
        this.content = "";
        this.id = message.id;

        this.role = message.role;

        this.threadId = message.thread_id;

        this.content += message.content
            .filter(contentItem => contentItem.type === 'text')
            .map(textContent => (textContent as TextContentBlock).text.value)
            .join('\n');
    }
}


export async function callFunction(functionName: string, params: any[]) {
    if (functionName === "getWeather") {
        return JSON.stringify(getWeather());
    }
    else if (functionName === "get_current_date_and_time") {
        return JSON.stringify(getCurrentDateAndTime());
    }
    else {
        throw Error(`${functionName} is not immplemented yet`)
    }
}


// Sends a message in the given thread to the given assistant
export async function sendMessage(threadId: string, assistantId: string, message: Message) {

    try {
        // Add a Message to the Thread
        await openai.beta.threads.messages.create(threadId, {
            role: message.role,
            content: message.content
        });

        // Run the Thread with the Assistant
        const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistantId
        });

        // Imediately fetch run-status, which will be "in_progress"
        let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

        // Polling mechanism to see if runStatus is completed
        //while (runStatus.status == "queued" || runStatus.status == "in_progress") {
        while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

            if (runStatus.status === "requires_action" && runStatus.required_action !== null) {
                //   console.log(
                //     runStatus.required_action.submit_tool_outputs.tool_calls
                //   );

                const toolCalls =
                    runStatus.required_action.submit_tool_outputs.tool_calls;
                const toolOutputs = [];

                for (const toolCall of toolCalls) {
                    const functionName: string = toolCall.function.name;

                    console.log(
                        `This question requires us to call a function: ${functionName}`
                    );

                    const args = JSON.parse(toolCall.function.arguments);

                    const argsArray = Object.keys(args).map((key) => args[key]);

                    // Dynamically call the function with arguments
                    //const output = await functions[functionName].apply(null, [args]);
                    const output = await callFunction(functionName, [args]);
                    toolOutputs.push({
                        tool_call_id: toolCall.id,
                        output: output,
                    });
                }
                // Submit tool outputs
                await openai.beta.threads.runs.submitToolOutputs(
                    threadId,
                    run.id,
                    { tool_outputs: toolOutputs }
                );
                continue; // Continue polling for the final response
            }

            // Check for failed, cancelled, or expired status
            if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
                console.log(
                    `Run status is '${runStatus.status}'. Unable to complete the request.`
                );
                break; // Exit the loop if the status indicates a failure or cancellation
            }
        }

    } catch (error) {
        console.error("Error sending message:", error);
    }
}

export async function createThread() : Promise<string> {
    // Create a Thread
    const threadResponse = await openai.beta.threads.create();

    return threadResponse.id;
}

export async function receiveThread(threadId: string) {
    try {
        const thread = await openai.beta.threads.retrieve(threadId);
        return thread;
    } catch (error) {
        console.error("Error processing chat:", error);
    }

}



export async function getThreadMessages(threadId: string, ascending: boolean = true): Promise<Message[]> {
    let result: Message[] = [];
    try {

        const messagesResponse = await openai.beta.threads.messages.list(threadId, {
            order: (ascending ? 'asc' : 'desc')
        });

        //const assistantResponses = messagesResponse.data.filter(msg => msg.role === 'assistant');
        const response = messagesResponse.data.map(msg =>
            new OpenAIMessage(msg)
        );

        // console.log(response);

        result = response;
    } catch (error) {
        console.error("Error processing chat:", error);
    }
    return result;
}



export async function removeThread(threadId: string) {
    //console.log(`Removing thread with ID: ${threadId}`);
    // Add more logic here

    try {
        const thread = await openai.beta.threads.del(threadId);
        return thread;
    } catch (error) {
        console.error("Error removing thread:", error);
    }
};


function getCurrentDateAndTime(): any {
    // Get current date and time
    const now = new Date();

    // Format date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    // Format time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Construct the full formatted date-time string
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;


    return formattedDateTime;
}

function calculateDaysBetweenDates(date1: Date, date2: Date): number {
    // Calculate the difference in milliseconds
    const differenceMs = date2.getTime() - date1.getTime();

    // Convert the difference to days
    const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

    return differenceDays;
}