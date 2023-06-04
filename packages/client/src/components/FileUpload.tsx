export const FileUpload = ({
  filename,
  onSelected,
}: {
  filename: string;
  onSelected: (filename: string, file: File) => void;
}) => {
  const selectFile = (event: any) => {
    event.target.files.length && onSelected(filename, event.target.files[0]);
  };
  return (
    <div className="input">
      <input onChange={selectFile} type="file"></input>
    </div>
  );
};
