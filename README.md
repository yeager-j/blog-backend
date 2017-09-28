# Blog Backend
This is a simple backend for my blog app. 

## Important Info
The file `./src/config/config.json` contains a secret key used by jwt.
Make sure you add this file to your `.gitignore`! It is included here for convenience.

## Validator
I wrote my own form validation script. Here's how you use it:

```javascript
let validation = await req.Validate.check({
    'name': 'required|min:3|max:30',
    'email': 'required|email|unique',
    'password': 'required|confirmed'
});
```

This example uses all available rules. If you make a field required, make sure you put the `required` rule first.