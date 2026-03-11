import { Resend } from "resend";

const resend = new Resend(Process.env.RESEND_API_KEY);

export async function sendEmailToImam(question, submissions) {
    try {
        await resend.emails.send({
            from: "Al Ansar Weekly <editor@alansarweekly.com>",
            to: [shafeeghani@gmail.com],
            reply_to
        )
    }
    }
    catch (err) {

}
}