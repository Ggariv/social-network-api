const { Schema, model } = require('mongoose');

const UserSchema = new Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true
            },
        email: {
            type: String,
            unique: true,
            required: true,
            match: [/[A-z0-9\W]+@[a-z]+.([a-z]+)/]
            },
        thoughts: [{
            type: Schema.Types.ObjectId,
            ref: 'Thoughts'
            }],
        friends: [{
            type: Schema.Types.ObjectId,
            ref: 'Users'
            }]
    },
    {
        toJSON: {
            virtuals: true,
            getters: true
            },
        id: false
    }
    )

UserSchema.virtual('friendCount').get(function() {
    return this.friends.length;
    })

const Users = model('Users', UserSchema);

module.exports = Users;