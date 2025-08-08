import FilesCard from '@/components/FilesCard';
import UploadButton from '@/components/UploadButton';

const Dashboard = () => {
  return (
    <main className="mx-auto max-w-7xl md:p-10 flex flex-col">
      <div className="mt-8 flex flex-col  justify-end gap-4 border-b border-gray-200 pb-5">
        <h1 className="mb-3 font-bold text-5xl text-gray-900">My Files</h1>

        <div className="flex justify-end">
          <UploadButton />
        </div>
      </div>

      <FilesCard />
    </main>
  );
};

export default Dashboard;
