// Main masterpage and navigation

exports.validation = {
    email: "You must enter a valid email address",
    completeField: "Please complete this field",
    usernameTaken: "That publisher name is already taken",
    password: "Passwords much contain at least 7 charactors that use a mixture of both upper and lowercase",
    passwordMatch: "Your passwords do not match"

}

exports.spotlight = {
    ui: {
        spotlight: "Spotlight",
        newBooks: "Latest Books",
        findOutMore: "Becoming an author has never been as easy, or fun. Get involved and <a class='' href='#'>submit your first chapter!</a>"
    }
}

exports.book = {
    ui: {
        chapter: "Chapter",
        verse: "Verse",
        voteNext: "Vote on the next chapter",
        share: "Share your thoughts...",
        comment: "Comment",
        signin: "Sign in to comment",
        voteChapter: "Vote for ",
        reportChapter: "Report",
        voteRemove: "Remove Vote",
        confirmVote: "Confirm Vote",
        votingConfirmation: "Voting Confirmation",
        voteMessage: "Please check the rules below...<br> Need to put here"
    }
}

exports.frame = {
    ui: {
        signUp: "Sign Up",
        logIn: "Log In",
        explore: "Explore",
        admin: "Admin",
        bookshop: "Bookshop",
        profile: "Profile",
        account: "Account",
        logout: "Log Out",
        browse: "Browse",
        spotlight: "Spotlight",
        genres: "Genres",
        charts: "Charts",
        authors: "Authors",
        create: "Create",
        startABook: "Start a Book",
        submitChapter: "Submit a Chapter",
        contribute: "Contribute",
        chapterVoting: "Chapter Voting",
        proofReading: "Proof Reading",
        users: "Users",
        manage: "Manage",
        add: "Add",
        books: "Books",
        jobs: "Jobs",
        view: "View"
    }

}
// Login pages
exports.login = {
    ui: {
        signUp: "Sign Up",
        loginToAccount: "Log in to your Account",
        emailAddress: "Email Address",
        password: "Password",
        retypePassword: "Re-type Password",
        username: "Publisher Name",
        newPassword: "Request a new Password",
        sendEmail: "Reset",
        backToLogin: "Back to login",
        forgottenPassword: "Forgotten your password?",
        logIn: "Log In",
        noAccount: "Don't have an Account?",
        alreadyRegistered: "Already have an Account?",
        registerLink: "No worrys, <a href='/register'>Click Here</a> to register",
        loginLink: "No worrys, <a href='/login'>Click Here</a> to login",
        resendEmail: "Resent Confirmation Email",
        emailExpired: "Your confirmation email has expired.",
        sendConfirmation: "Send new Confirmation email",
        newPasswordSent: "Password Reset",
        checkEmail: "Please check your email for further instructions",
        resetPassword: "Reset Password",
        update: "Update",
        continue: "continue",
        passwordExpired: "Your password reset has expired."

    },
    messages: {
        failedPassword: "Your passwords did not match.",
        invalidEmail: "Please enter a valid email.",
        alreadyRegistered: "Your email is already registered",
        registrationSuccessful: "Your email has not been confirmed. Please check your email or <a href='/resend'>request a new confirmation email</a>",
        incorrectDetails: "Oops, have you entered the correct details?",
        loggedOut: "You are now logged out",
        emailResent: "A new confirmation is on its way!",
        passwordChanged: "Your password has been updated",
        usernameTaken: "Username Taken",
        missingField: "Please complete all fields"
    }
}

exports.profile = {
    ui: {
        publisherPoints: "Publisher Points",
        followers: "Followers",
        chapters: "Chapters",
        editProfile: "Edit Profile",
        about: "About",
        noCity: "Cair Paravel",
        noCountry: "Narnia",
        noBio: "is a little shy and has not yet written a bio :(", // follows username
        recentActivity: "Recent Activity",
        postSomething: "Post Something...",
        post: "Post",
        booksFollowing: "Books I'm Following",
        following: "Following",
        noFollowing: "Not following anyone yet",
        books: "Books",
        authors: "Authors",
        changePassword: "Change Password",
        update: "Update",
        password: "Password",
        retypePassword: "Re-type Password",
        notConfirmed: "You have yet to confirm your email address. <a href='/resendemail'> Resent confirmation email</a>"
    },
    messages: {
        failedPassword: "Your passwords did not match.",
        passwordChanged: "Your password has been updated"
    }

}

// Admin Pages
exports.admin = {
    ui: {
        manageUsers: "Manage Users",
        username: "Username",
        email: "Email",
        status: "Status",
        role: "Role",
        emailStatus: "Email Status",
        tags: "Tags",
        created: "Created",
        updated: "Updated",
        actions: "Actions",
        active: "Active",
        inActive: "InActive",
        banned: "Banned",
        admin: "Admin",
        user: "User",
        confirmed: "Confirmed",
        unConfirmed: "Unconfirmed",
        verified: "Verified",
        edit: "Edit",
        userID: "User ID",
        username: "Username",
        firstName: "First Name",
        surname: "Surname",
        email: "Email",
        pasword: "Password",
        passwordSalt: "Password Salt",
        userIp: "User IP",
        settings: "Settings:",
        emailConfirmed: "Email Confirmed",
        changePassword: "Change Password",
        resendConfirmation: "Resend Confirmation Email",
        passwordReset: "Trigger Password Reset",
        saveChanges: "Save Changes"
    },
    messages: {
        profileUpdated: "Profile successfully updated",
        updateFailed: "Unable to update the user profile",
        cantGetUsers: "Unable to get users."
    }
}

exports.editProfile = {
    ui: {
        editProfile: "Edit Profile",
        myDetails: "Basic Details",
        username: "Username",
        firstName: "First Name",
        surname: "Surname",
        email: "Email",
        city: "City",
        country: "Country",
        myBio: "Bio",
        shortBio: "Short Bio",
        changePassword: "Change Password",
        saveChanges: "Save Changes"
    },
    messages: {
        profileUpdated: "Profile successfully updated",
        updateFailed: "Unable to update your profile. Please try again"
    }

}

// USer activiy wall messagess
exports.userActivity = {
    newMember: ' become a member of draftler, woop woop!' // follows username
}