interface Props {
  name: string;
}

export const Hello = ({ name }: Props) => {
  return <div>Hello, 1, {name}!</div>;
};
