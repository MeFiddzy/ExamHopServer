const usernameAllowedChar = "abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";

const passwordAllowedChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?`~";

function isUserCorrect(username: string): boolean {
    for (const ch of username) {
        if (!usernameAllowedChar.includes(ch)) {
            return false;
        }
    }

    if (username.length < 3 || username.length > 20) {
        return false;
    }

    return true;
}

function isValidEmail(email : string) : boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(pass : string) : boolean {
    if (pass.length < 8)
        return false;

    const numbers = "1234567890";
    const lettersLowercase = "abcdefghijklmnopqrstuvwxyz";
    const lettersUppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let numLettersLow = 0;
    let numLettersUp = 0;
    let numNum = 0;
    let numSpecialChar = 0;

    for (const char of pass) {
        if (!passwordAllowedChar.includes(char))
            return false;

        if (numbers.includes(char)) {
            numNum++;
        }
        else if (lettersLowercase.includes(char)) {
            numLettersLow++;
        }
        else if (lettersUppercase.includes(char)) {
            numLettersUp++;
        }
        else {
            numSpecialChar++;
        }
    }

    return (numNum && numLettersLow && numLettersUp && numSpecialChar) ? true : false;
}