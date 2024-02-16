import { Auth } from '../capability';

export default function handleSessionExpiryError(apiError) {
    if (apiError && apiError.code === '16') { // TODO: handle logout
        console.log('^^^^^^ logout error handling of api ^^^^^^^');
        Auth.logout();
    }
}
