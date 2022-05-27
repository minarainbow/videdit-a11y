import React from "react";
import IconButton from '@material-ui/core/IconButton'
import { Button, Header, Image, Popup, ModalActions, Input } from 'semantic-ui-react'
import firebase from 'firebase/app';
import 'firebase/database';
import scriptData from "../scripts/ZaQtx54N6iU-aligned-sents";

const databaseURL = "https://videdita11y-default-rtdb.firebaseio.com/"

export default class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          comment_index: 0,
          isOpen: false,
          comment: ''
        };
        this.handleAddComment = this.handleAddComment.bind(this);
      }
      


      handleAddComment = () => {
        console.log(this.props.selectedDivs);
        const [startDiv, endDiv] = this.props.selectedDivs;
        const startKey = startDiv.getAttribute("data-offset-key");
        const endKey = endDiv.getAttribute("data-offset-key");
        const children = startDiv.parentElement.children;
        const comment = this.state.comment
        var i = 0;
        var startIdx;
        for (i = 0; i < children.length; i++) {
          if (startKey === children[i].getAttribute("data-offset-key")) {
            startIdx = i;
            break;
          }
        }
        for (i = startIdx; i < children.length; i++) {
          var words = children[i].querySelectorAll("span.Word");
          if (i==startIdx && comment)
            words[0].setAttribute("new-data-comment", comment)
          for (var j = 0; j < words.length; j++) {
            words[j].setAttribute("data-comment", this.state.comment_index);
          }
          if (endKey === children[i].getAttribute("data-offset-key")) {
            break;
          }
        }

        this.setState({comment: '', comment_index: this.state.comment_index +1})
        this.props.changeCommentState()
      };




    render() {
        const { open, selectRole, isOpen } = this.props;
        const { comment} = this.state;
        return (     
          <Popup
            className="comment"
            open={this.props.isOpen}
            on="click"
            trigger={this.props.commentButton}
            size="large"
            position="bottom left"            
          >
            <Popup.Header>Comment</Popup.Header>
            <Popup.Content>
            <Input type="text" placeholder="Leave your comment here" value={comment} onChange={(e) => this.setState({comment: e.target.value})}/>
              <Button
                  disabled={comment.length === 0}
                  positive
                  content='Comment'
                  onClick={()=>this.handleAddComment()}
                />
              <Button
                content='Cancel'
                onClick={()=>this.props.changeCommentState()}
              />
            </Popup.Content>
          </Popup>
        )
    }};