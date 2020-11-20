import {getAddressType} from "../../utils/UserAddress";


export function CreateRoom(opts){
            // let opts = this._roomCreateOptions();
            console.log('----createRoom----')
            const vtx = this;
            if (opts.spinner === undefined) opts.spinner = true;
            if (opts.guestAccess === undefined) opts.guestAccess = true;
            if (opts.encryption === undefined) opts.encryption = false;

            const client = window.mxMatrixClientPeg.matrixClient;

            const defaultPreset = opts.dmUserId ? "trusted_private_chat" : "private_chat";

            // set some defaults for the creation
            const createOpts = opts.createOpts || {};
            createOpts.preset = createOpts.preset || defaultPreset;
            createOpts.visibility = createOpts.visibility || "private";
            if (opts.dmUserId && createOpts.invite === undefined) {
                switch (getAddressType(opts.dmUserId)) {
                    case 'mx-user-id':
                        createOpts.invite = [opts.dmUserId];
                        break;
                    case 'email':
                        createOpts.invite_3pid = [{
                            id_server: client.getIdentityServerUrl(true),
                            medium: 'email',
                            address: opts.dmUserId,
                        }];
                }
            }
            if (opts.dmUserId && createOpts.is_direct === undefined) {
                createOpts.is_direct = true;
            }

            // By default, view the room after creating it
            if (opts.andView === undefined) {
                opts.andView = true;
            }

            createOpts.initial_state = createOpts.initial_state || [];

            // Allow guests by default since the room is private and they'd
            // need an invite. This means clicking on a 3pid invite email can
            // actually drop you right in to a chat.
            if (opts.guestAccess) {
                createOpts.initial_state.push({
                    type: 'm.room.guest_access',
                    state_key: '',
                    content: {
                        guest_access: 'can_join',
                    },
                });
            }

            if (opts.encryption) {
                createOpts.initial_state.push({
                    type: 'm.room.encryption',
                    state_key: '',
                    content: {
                        algorithm: 'm.megolm.v1.aes-sha2',
                    },
                });
            }
            return client.createRoom(createOpts);
}