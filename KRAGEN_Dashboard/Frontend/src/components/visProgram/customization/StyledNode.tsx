import { Presets } from "rete-react-plugin";
import { css } from "styled-components";

const styles = css<{ selected?: boolean }>`
  background: #ebebeb;
  border-color: #646464;
  .title {
    color: #646464;
  }
  &:hover {
    background: #f2f2f2;
  }
  .output-socket {
    margin-right: -1px;
  }
  .input-socket {
    margin-left: -1px;
  }
  ${(props) =>
    props.selected &&
    css`
      border-color: red;
    `}
`;

export function StyledNode(props: any) {
  return <Presets.classic.Node styles={() => styles} {...props} />;
}
