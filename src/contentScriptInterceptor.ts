import {Gender, Person, Student} from "./storage";
import {MessageKind, TabMessage} from "./events";

class TargetOptions {
    casing: string;

    constructor(casing: string) {
        this.casing = casing;
    }
}

class Target {
    options: TargetOptions

    constructor(options: TargetOptions) {
        this.options = options
    }

    field(selector: string, value: string) {
        const element = document.querySelector(selector)
        if (element && value) {
            element.value = this.casing(value)
            element.dispatchEvent(new Event('input'));
        }
    }

    select(selector: string, index: number) {
        const element = document.querySelector(selector)
        if (element && index) {
            element.value = index
            element.dispatchEvent(new Event('change'));
        }
    }

    radio(selector: string, index: number) {
        const element = document.querySelector(selector + '[value="' + index + '"]')
        if (element && index) {
            element.checked = true
            element.dispatchEvent(new Event('click'));
        }
    }

    casing(value: string) {
        switch (this.options.casing) {
            case "uppercase":
                return value.toUpperCase()
            default:
                return value
        }
    }
}

const abc = new Target(new TargetOptions("uppercase"));

(function () {
    chrome.runtime.onMessage.addListener(
        function (message: TabMessage, sender, sendResponse) {
            switch (message.kind) {
                case MessageKind.PasteAbcInscriptionId:
                    pasteStudentIDToABC(JSON.parse(message.payload), abc);
                    break
                case MessageKind.PasteAbcInscriptionStudent:
                    pasteStudentInscriptionToABC(JSON.parse(message.payload), abc);
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

function pasteStudentIDToABC(student: Student, target: Target) {
    try {
        console.log("About to paste inscription ID:", student)
        target.field('[id="abmNroDoc"]', student.nationalID);
        target.field('[ng-model="form.inscripcion.fechaInscripcionReal"]', "2023-02-27");
        target.select('[id="abmSexo"]', genderToIndex(student));
    } catch (e) {
        console.error("Error pasting:", e)
    }
}

function pasteStudentInscriptionToABC(student: Student, target: Target) {
    try {
        console.log("About to paste inscription student:", student)
        target.field('[ng-model="form.datos.apellido"]', student.lastName.toUpperCase());
        target.field('[ng-model="form.datos.nombreNominal"]', student.firstName);
        target.select('[ng-model="form.datos.sexo"]', genderToIndex(student))
        target.field('[ng-model="form.datos.fechaNac"]', student.birthDate);
        target.field('[ng-model="form.datos.calle"]', student.address.streetName);
        target.field('[ng-model="form.datos.numero"]', student.address.streetNumber);
        target.field('[ng-model="form.datos.entreCalles"]', "No informa");
        target.radio('[name="chkTransporte"][value="7"]', 7);
        pasteCaregiver(1, student.father, target)
        pasteCaregiver(2, student.mother, target)
    } catch (e) {
        console.error("Error pasting:", e)
    }
}

function pasteCaregiver(number: number, person: Person, target: Target) {
    const tutor = (number == 1) ? 2 : (number == 2) ? 1 : -1
    target.select('[ng-model="form.responsable' + number + '.tipoTutor"]', tutor);
    target.field('[ng-model="form.responsable' + number + '.apellido"]', person.lastName);
    target.field('[ng-model="form.responsable' + number + '.nombreNominal"]', person.firstName);
    target.radio('[ng-model="form.responsable' + number + '.poseeDoc"]', 4);
    target.select('[ng-model="form.responsable' + number + '.tipoDoc"]', 1);
    target.field('[ng-model="form.responsable' + number + '.nroDoc"]', person.nationalID);
}

function genderToIndex(person: Person) {
    if (person.gender) {
        return person.gender.valueOf()
    } else {
        return Gender.Unknown.valueOf()
    }
}

