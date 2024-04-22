// admin.ts - This is command line interface
// Usage node --env-file=.env.local admin.js --params params 
// Import the minimist module for command line handling
import minimist from "minimist";

import * as OpenAIService from '../services/OpenAIService'


//import fetch from 'node-fetch';

const assistantId = process.env.ASSISTANT_ID;

const processCommand = () => {
    const args = minimist(process.argv.slice(2));

    if (args.create_thread) {
        //createThread(args.create_thread);
    } else if (args.remove_thread) {
        removeThread(args.remove_thread);
    } else if (args.list_threads) {
        listThreads();
    } else if (args.show_thread) {
        showThread(args.show_thread);
    } else if (args.send_message) {
        // Extract the thread ID and the message
        const threadId = args.send_message
        const message = args._.length > 0 ? args._[0] : null;

        if(threadId != null && message != null) {
            sendMessage(threadId, message);
        } else {
            console.error('Missing arguments. Usage node --send_message <thread_id> <message> Send the given message to the given thread');
        }
    } else if (args.test_function) {
        testFunction();
    } else {
        logUsageText();
    }
};


function logUsageText() {
    console.log('Usage:');
    //console.log('  --create_thread <thread_id>  Create a new thread with the specified ID');
    console.log('  --remove_thread <thread_id>  Remove the thread with the specified ID');
    //console.log('  --list_threads <thread_id>  List all threads');
    console.log('  --show_thread <thread_id>  Shows the contents of the thread with the specified ID');
    console.log('  --send_message <thread_id>  <message> Send the given message to the given thread');
}

const createThread = (threadId: string) => {
    console.log(`NOT SUPPORTED YET - Creating thread with ID: ${threadId}`);
    // Add logic to create a thread
};
async function removeThread(threadId: string) {
    console.log(`Removing thread with ID: ${threadId}`);
    // Add logic to remove a thread
    OpenAIService.removeThread(threadId);
};

const listThreads = () => {
    console.log(`Listing threads is not supported in the OpenAI API yet`);
    // Add logic to remove a thread
    //let threads = OpenAIService.listThreads();
};

async function showThread(threadId: string) {
    console.log(`Showing thread with ID: ${threadId}`);
    // Add logic to remove a thread
    //let thread = OpenAIService.receiveThread(threadId);
    //console.log(thread);
    const messages = await OpenAIService.getThreadMessages(threadId, false);
    console.log(messages);
};

async function sendMessage(threadId: string, message: string) {
    console.log(`Sending message <${message}> to thread with ID: ${threadId}`);
    // Add logic to remove a thread
    //console.log(thread);
    if (assistantId != undefined) { 
        await OpenAIService.sendMessage(threadId, assistantId, <OpenAIService.Message>{role: 'user', content: message});
        
        // Show the messages
        const messages = await OpenAIService.getThreadMessages(threadId, false);

        if(messages.length > 1) {
        console.log(messages[1]);
        console.log(messages[0]);
        }
        else {
            console.log("No answer")
        }
    }
    else {
        console.error("ASSISTANT_ID must be set in environment")
    }
};

async function testFunction() {
    //console.log(await getWeather());
}


processCommand();
