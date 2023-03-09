import {Gender, initializeStorageWithDefaults, setStorageData, Student} from './storage';

async function updateActiveStudent(student: Student) {
    if (student) {
        await setStorageData({active: student});
        const initials = (student.firstName[0] + student.lastName[0]).toUpperCase()
        await chrome.action.setBadgeText({text: initials});
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    // Here goes everything you want to execute after extension initialization

    await initializeStorageWithDefaults({active: null});

    chrome.runtime.onMessage.addListener(
        async function (request, sender, sendResponse) {
            if (request["copy-event"]) {
                const text = request["copy-event"]
                const student = parseStudentFromClipboard(text);
                await updateActiveStudent(student);
            }
        }
    );
});

function parseStudentFromClipboard(content: string): Student {
    const values = content.split("\t");
    if (values.length > 80) {
        return {
            firstName: values[3],
            lastName: values[2],
            nationalID: values[5],
            birthDate: parseDate(values[6]),
            gender: parseGender(values[8]),
            address: {
                streetName: values[12],
                streetNumber: values[13],
            },
            father: {
                firstName: values[22],
                lastName: values[21],
                nationalID: values[26],
                birthDate: parseDate(values[24]),
                gender: Gender.Male
            },
            mother: {
                firstName: values[39],
                lastName: values[38],
                nationalID: values[44],
                birthDate: values[42],
                gender: Gender.Female
            }
        }
    } else console.info("Cannot parse, expected tabbed values but found: ", content)
    return null
}

function parseDate(date: string): string {
    const [day, month, year] = date.split('/');
    const parsed = new Date(+year, +month - 1, +day)
    return parsed.toISOString().substring(0, 10);
}

function parseGender(gender: string): Gender {
    return gender == "Masculino" ? Gender.Male : gender == "Femenino" ? Gender.Female : Gender.Unknown;
}

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
    for (const [key, value] of Object.entries(changes)) {
        console.log(`"${key}" changed from "${value.oldValue}" to "`, value.newValue);
    }
});
