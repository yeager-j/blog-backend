let mongoose = require('mongoose');

module.exports = class Validate {
    constructor(req, res) {
        this._req = req;
        this._res = res;
        this._emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    }

    parse(check) {
        let checkArray = check.split('|');
        let checkObj = {};

        checkArray.forEach(check => {
            if (check.includes(':')) {
                let arr = check.split(':');
                checkObj[arr[0]] = arr[1];
            } else {
                checkObj[check] = true;
            }
        });

        return checkObj;
    }

    async check(checks) {
        let errors = [];

        for (let prop in checks) {
            let value = this.req.body[prop];

            let parsedCheck = this.parse(checks[prop]);

            valid:
            for (let check in parsedCheck) {
                switch (check) {
                    case 'required':
                        if (!value) {
                            errors.push(`${prop} is required!`);
                            break valid;
                        }
                        break;
                    case 'min':
                        if (value.length < parseInt(parsedCheck[check])) {
                            errors.push(`${prop} is too short! It should be at least ${parsedCheck[check]} characters.`);
                        }
                        break;
                    case 'max':
                        if (value.length > parseInt(parsedCheck[check])) {
                            errors.push(`${prop} is too long! It should be under ${parsedCheck[check]} characters.`);
                        }
                        break;
                    case 'email':
                        if (!this._emailRegex.test(value)) {
                            errors.push(`${prop} is not a valid email!`);
                        }
                        break;
                    case 'unique':
                        let Model = mongoose.model(parsedCheck[check]);

                        try {
                            let m = await Model.findOne({
                                [prop]: value
                            });

                            if (m) {
                                errors.push(`${prop} needs to be unique!`);
                            }
                            break;
                        } catch (e) {
                            errors.push('Internal server error.');
                        }
                        break;
                    case 'confirmed':
                        let field = this.req.body.confirm_password;

                        if (value !== field) {
                            errors.push(`Passwords must match!`);
                        }
                        break;
                }
            }
        }

        return {
            errors,
            passed: errors.length === 0
        };
    }

    get res() {
        return this._res;
    }

    get req() {
        return this._req;
    }
};
