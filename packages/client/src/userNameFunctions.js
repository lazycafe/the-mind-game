const userNameKeyId = 'userNameKey';

export function getUserName(shouldSetDefault = true) {
    let userName = localStorage.getItem(userNameKeyId);
    if (!userName && shouldSetDefault) {
        userName = Math.random()+'';
        setUserName(userName);
    }
    return userName;
}

export function setUserName(name) {
    if (name && name.trim && name.trim()) {
        localStorage.setItem(userNameKeyId, name.trim());
    }
}