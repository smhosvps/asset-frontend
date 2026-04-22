

type Props = {};

export default function OurServices({}: Props) {
  return (
    <section className="">
      <div className=" max-w-6xl mx-auto">
        {/* <div className="text-center mb-16">
          <p className="text-[#FF8C00] font-semibold mb-4">OUR SERVICES</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            We Provide Prompt
            <br />
            And Excellent Services
          </h2>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* Installation Services Card */}
          <div className="bg-white rounded-xl shadow-md p-8 transition-all hover:shadow-lg">
            <h3 className="text-xl font-bold text-[#FF8C00] mb-4">
              Installation
              <br />
              Services
            </h3>
            <p className="text-gray-600">
              Installation of facilities or equipment deployed to your apartment
              or offices
            </p>
          </div>

          {/* Equipment Services Card */}
          <div className="bg-white rounded-xl shadow-md p-8 transition-all hover:shadow-lg">
            <h3 className="text-xl font-bold text-[#FF8C00] mb-4">
              Equipment
              <br />
              Request Services
            </h3>
            <p className="text-gray-600">
              Request for new equipment or absent facilities in your apartment
              or offices
            </p>
          </div>

          {/* Maintenance Services Card */}
          <div className="bg-white rounded-xl shadow-md p-8 transition-all hover:shadow-lg">
            <h3 className="text-xl font-bold text-[#FF8C00] mb-4">
              Maintenance
              <br />
              Request Services
            </h3>
            <p className="text-gray-600">
              Repair of faulty equipment and facilities within the various
              properties
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
