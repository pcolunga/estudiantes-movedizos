import {Gender, Person, Student} from "./storage";
import {MessageKind, TabMessage} from "./events";

(function () {
    chrome.runtime.onMessage.addListener(
        async function (message: TabMessage, sender, sendResponse) {
            switch (message.kind) {
                case MessageKind.PasteAbcInscriptionId:
                    await pasteStudentIDToABC(JSON.parse(message.payload));
                    break
                case MessageKind.PasteAbcInscriptionStudent:
                    await pasteStudentInscriptionToABC(JSON.parse(message.payload));
                    break
                default:
                    console.log("Unknown message kind:", message)
            }
            sendResponse("Message received.")
        }
    );
    setInterval(() => {
        fetch("https://misaplicaciones1.abc.gob.ar/MisEstudiantes/jsps/divAdministracionDatosEstablecimiento.jsp")
            .catch((reason) => {
                console.log("Keep alive fetch failed: ", reason)
            })
            .then((response) => {
                console.log("Keep alive fetch response:", response)
            })
    }, 90000)
})()

async function pasteStudentIDToABC(student: Student) {
    try {
        console.log("About to paste inscription ID:", student)
        field('[id="abmNroDoc"]', student.nationalID);
        field('[ng-model="form.inscripcion.fechaInscripcionReal"]', "2023-02-27");
        select('[id="abmSexo"]', genderToIndex(student));
    } catch (e) {
        console.error("Error pasting:", e)
    }
}

function pasteStudentInscriptionToABC(student: Student) {
    try {
        console.log("About to paste inscription student:", student)
        field('[ng-model="form.datos.apellido"]', student.lastName.toUpperCase());
        field('[ng-model="form.datos.nombreNominal"]', student.firstName);
        select('[ng-model="form.datos.sexo"]', genderToIndex(student))
        field('[ng-model="form.datos.fechaNac"]', student.birthDate);
        field('[ng-model="form.datos.calle"]', student.address.streetName);
        field('[ng-model="form.datos.numero"]', student.address.streetNumber);
        pasteCaregiver(1, student.father)
        pasteCaregiver(2, student.mother)
    } catch (e) {
        console.error("Error pasting:", e)
    }
}

function pasteCaregiver(number: number, person: Person) {
    const tutor = (number == 1) ?  2 : (number == 2) ? 1 : -1
    select('[ng-model="form.responsable' + number + '.tipoTutor"]', tutor);
    field('[ng-model="form.responsable' + number + '.apellido"]', person.lastName);
    field('[ng-model="form.responsable' + number + '.nombreNominal"]', person.firstName);
    radio('[ng-model="form.responsable' + number + '.poseeDoc"]', 4);
    select('[ng-model="form.responsable' + number + '.tipoDoc"]', 1);
    field('[ng-model="form.responsable' + number + '.nroDoc"]', person.nationalID);
}

async function field(selector: string, value: string) {
    const element = document.querySelector(selector)
    if (element && value) {
        element.value = value
        element.dispatchEvent(new Event('input'));
    }
}

function select(selector: string, index: number) {
    const element = document.querySelector(selector)
    if (element && index) {
        element.value = index
        element.dispatchEvent(new Event('change'));
    }
}

function radio(selector: string, index: number) {
    const element = document.querySelector(selector + '[value="' + index +'"]')
    if (element && index) {
        element.checked = true
        element.dispatchEvent(new Event('click'));
    }
}

function genderToIndex(person: Person) {
    if (person.gender) {
        return person.gender.valueOf()
    } else {
        return Gender.Unknown.valueOf()
    }
}
