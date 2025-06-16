import { Modal } from 'c3react';

/** Declare modal show props */
type ShowProps = {};

/** Declare modal hide props */
type HideProps = {};

class BoxModal extends Modal<ShowProps, HideProps> {
    protected override onReady() {
        console.log('Modal ready!', this.container);
    }

    protected override onShow(props: ShowProps | null) {
        this.container.setPosition(250, 250);
    }

    protected override onHide(props: ShowProps | null) {
        this.container.setPosition(-1000, -1000);
    }
}

const modal = new BoxModal('box', {
    layersToDisable: [],
});
export default modal;
