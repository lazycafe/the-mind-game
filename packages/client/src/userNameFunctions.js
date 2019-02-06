const userNameKeyId = 'userNameKey';

function getUserName() {
    let userName = localStorage.getItem(userNameKeyId);
    if (!userName) {
        userName = Math.random()+'';
        setUserName(userName);
    }
    return userName;
}

function setUserName(name) {
    if (name && name.trim && name.trim()) {
        localStorage.setItem(userNameKeyId, name.trim());
    }
}