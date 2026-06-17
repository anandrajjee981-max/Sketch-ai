import jwt from 'jsonwebtoken';

async function verifyme(req, res, next) {
    // 1. Check if cookies exist safely (using optional chaining '?.' just in case)
    const authtoken = req.cookies.authToken;
    
    if (!authtoken) {
        return res.status(401).json({ // 401 is structurally more accurate for Unauthenticated
            message: "Token expired or missing"
        });
    }

    try {
        // 2. Remove 'await' since jwt.verify is synchronous
        const decoded = jwt.verify(authtoken, process.env.JWT_SECRET);
        
        // 3. FIXED: Attach the decoded data to 'req.user' so your getme controller can see it
        req.user = decoded; 
        
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
}

export default verifyme;