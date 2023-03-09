import '../styles/popup.scss';
import {MessageKind, TabMessage} from "./events";
import {getStorageData, setStorageData, Student} from "./storage";

document.getElementById('paste-abc-inscription-student').addEventListener('click', async () => {
        const storage = await getStorageData();
        const active = storage.active;
        if (active) {
            const msg = { kind: MessageKind.PasteAbcInscriptionStudent, payload: JSON.stringify(active) }
            await sendToLastTab(msg);
        }
    }
)

document.getElementById('paste-abc-inscription-id').addEventListener('click', async () => {
        const storage = await getStorageData();
        const active = storage.active;
        if (active) {
            const msg = { kind: MessageKind.PasteAbcInscriptionId, payload: JSON.stringify(active) }
            await sendToLastTab(msg);
        }
    }
)

document.getElementById('delete-active').addEventListener('click', async () => {
        await setStorageData({ active: null } );
        readActiveStudent()
    }
)

async function sendToLastTab(msg: TabMessage) {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    await chrome.tabs.sendMessage(tab.id, msg);
}

// (async () => {
// const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
// document.getElementById('student').innerText = "Tab: " + tab.title
// await chrome.tabs.sendMessage(tab.id, {greeting: "hello"}, (response) => console.log("response: ", response));
// do something with response here, not outside the function
// console.log(response);

// })();
// chrome.runtime.openOptionsPage();
// })

document.addEventListener('DOMContentLoaded', function () {
    readActiveStudent();
    // Re-read the clipboard every time the page becomes visible.
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
            readActiveStudent();
        }
    });
});

function readActiveStudent() {
    console.log("About to read storage...");
    getStorageData().then((s) => {
        const active = s.active;
        console.log("Active: ", active);
        if (active) {
            renderStudent(active)
        } else {
            document.getElementById('student')!.innerText = ""
        }
    })
}

function renderStudent(student: Student) {
    console.log("About to render: ", student)
    document.getElementById('student')!.innerText = student.lastName + ", " + student.firstName
}
