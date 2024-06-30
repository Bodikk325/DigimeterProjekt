export class AuthServiceHelper {

    public static getJwtToken() : string
    {
      return localStorage.getItem("currentUser") ?? ""
    }
  
    public static checkIfUserIsLoggedIn(): boolean {
      return localStorage.getItem("currentUser") != null;
    }
    
}