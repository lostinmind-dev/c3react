import { Modal } from 'c3react';

class BoxModal extends Modal<{
    /** Declare modal events */
}, {
        /** Declare modal show props */
    }, {
        /** Declare modal hide props */
    }> {
    protected override onReady() {
        console.log('Modal ready!', this.container)
    }

    protected override onShow(props?: NonNullable<this['showProps']>) {
        this.container.setPosition(250, 250)
    }

    protected override onHide(props?: NonNullable<this['hideProps']>) {
        this.container.setPosition(-1000, -1000)
    }

}

const modal = new BoxModal('box', {
    layersToDisable: []
});
export default modal;